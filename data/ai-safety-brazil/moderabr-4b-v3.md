# ai-safety-brazil/moderabr-4b-v3

## Resumen

ModeraBR-4B-v3 es un adapter LoRA de clasificación de texto desarrollado por ai-safety-brazil sobre el modelo base Qwen/Qwen3.5-4B. Su propósito es detectar ofensividad, toxicidad contextual y discurso de odio en portugués, con una interfaz de tres tareas (`offensive`, `context`, `hate`) y umbrales calibrados documentados en el repositorio. No es un modelo completo: los pesos del adapter no incluyen los del modelo base, que debe cargarse por separado en bfloat16.

La relevancia del proyecto reside en su enfoque metodológico: separa los conjuntos de evaluación por grupos de duplicados, calibra umbrales sobre una partición específica de HateBR y publica intervalos de confianza pareados, además de documentar explícitamente los resultados negativos de versiones anteriores. El autor advierte que se trata de un modelo experimental y que la evidencia disponible corresponde a transferencia con calibración en la fuente, no a rendimiento zero-shot ni a tráfico real.

El modelo está entrenado exclusivamente para portugués, con licencia CC-BY-SA-4.0, y su uso previsto es la moderación de contenido como clasificador, no como generador conversacional. El repositorio ocupa 0,1 GB y las pruebas reportadas se ejecutaron en una GPU A100; no se ha establecido el comportamiento en CPU, cuantización u otros backends.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen3.5-4B |
| Parámetros totales | no disponible (adapter LoRA; el base tiene 4B) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | 8.190 tokens (entrada máxima, incluidos política y ejemplos; se rechazan entradas mayores) |
| Tipos de cuantización | no establecido (las pruebas se realizaron en bfloat16) |
| Idiomas soportados | portugués (pt) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | safetensors (adapter LoRA PEFT) |

## Arquitectura y entrenamiento

El adapter se aplica sobre Qwen3.5-4B, un transformer de 4.000 millones de parámetros. El checkpoint seleccionado, `mixed-expanded-s177`, se entrenó con rango LoRA nativo 8, learning rate 5e-5, batch de 64 y 177 pasos, sobre 11.328 ejemplos y 3.506.025 tokens. La supervisión cubre el dígito de decisión y el token EOS, con el prompt enmascarado. Se compararon pilotos con datos humanos, sintéticos y mixtos, con un techo de 2 millones de tokens, antes de seleccionar el ajuste mixto expandido.

La innovación metodológica no está en la arquitectura sino en el protocolo de evaluación: partición de HateBR por grupos de duplicados (1.431 ejemplos para calibrar umbrales y 5.569 para la evaluación final), intervalos de confianza pareados por grupos, y uso de políticas y verosimilitudes explícitas de los dígitos en lugar de prompts no registrados. La puntuación se calcula como `logit(1) - logit(0) >= umbral`, y la probabilidad devuelta es condicional a los dos dígitos legales, no una probabilidad calibrada de daño. Los datos de entrenamiento combinan mteb/told-br, dougtrajano/olid-br y dos conjuntos sintéticos propios (moderacao-fronteiras-br-synthetic y odio-contexto-br-synthetic).

## Capacidades

- Clasificación de ofensividad (`task="offensive"`): insultos, ataques, obscenidad y palabras malsonantes ofensivas, incluso sin destinatario.
- Clasificación de toxicidad contextual (`task="context"`): insulto personal, humillación o amenaza dirigida; distingue de palabras malsonantes sin destinatario, crítica a productos o decisiones y citas claramente condenadas.
- Clasificación de discurso de odio (`task="hate"`): depreciación o exclusión respaldada contra identidades protegidas; descarta mención neutra o positiva, contradiscurso y cita rechazada.
- Control de negativos mediante ejemplos few-shot publicados, solo de los datos sintéticos propios.
- Perfil de umbrales `general` (desarrollo) y `hatebr` (solo para `task="offensive"`, reproduce el punto de operación calibrado en HateBR).
- Comparación con el modelo base sin adapter mediante `use_adapter=False`, con la misma política y umbral propio del base.
- No soporta tool calling, agentes, visión, audio ni generación conversacional; la entrada debe ser un texto a clasificar, no instrucciones.

## Casos de uso

- Moderación de comentarios en foros y medios: clasificación de ofensividad en portugués sobre textos de hasta 8.190 tokens, con umbrales ajustables según la política del operador y comparación contra el base sin adapter para auditar el efecto del ajuste.
- Detección de discurso de odio en plataformas sociales: la tarea `hate` separa depreciación respaldada de identidades protegidas frente a mención neutra o contradiscurso, reduciendo falsos positivos respecto al base en HateCheck (19,64% frente a 49,82%).
- Filtrado previo en pipelines de moderación humana: el clasificador puede priorizar la cola de revisión manual, dado que los falsos positivos en HateCheck bajaron de 553 a 218 en la partición evaluada.
- Análisis de toxicidad contextual en comunidades: la tarea `context` distingue insulto dirigido de crítica educada o cita condenada, útil para moderar hilos donde el contexto cambia la interpretación.
- Investigación en seguridad de modelos en portugués: el repositorio publica hashes, versiones, resúmenes de entrenamiento y resultados negativos previos en SafetyEval-BR, lo que permite reproducir y auditar el protocolo.
- Evaluación comparativa de clasificadores: el helper permite ejecutar el mismo caso con y sin adapter, lo que facilita medir la ganancia del ajuste en un dominio concreto antes de desplegarlo.

## Benchmarks y rendimiento

Datos reportados por el autor (macro-F1), con los mismos casos, política y método de puntuación entre sistemas:

| Tarea / fuente | N | Base sin ajuste | CPU TF-IDF | ModeraBR-v3 |
|---|---:|---:|---:|---:|
| HateBR · ofensividad | 5.569 | 86,33% | 58,06% | 89,48% |
| OLID-BR · ofensividad | 1.738 | 65,36% | 62,99% | 70,93% |
| HateCheck PT · discurso de odio | 3.691 | 77,87% | 38,46% | 90,19% |
| Contexto · sintético | 2.000 | 90,26% | 99,79% | 99,84% |
| Odio · sintético | 1.000 | 96,67% | 99,17% | 99,58% |

El resultado primario en los 5.569 ejemplos de HateBR fuera del entrenamiento de los pesos es de +3,15 puntos porcentuales sobre el base, con intervalo de confianza pareado por grupos del 95% de [+2,36; +3,89]. En HateCheck, el recall cayó de 99,07% a 97,09% y los falsos positivos de 49,82% a 19,64% (de 553 a 218), con falsos negativos de 24 a 75; la caída de recall supera el límite original de 1 punto. Los conjuntos sintéticos no establecen rendimiento en tráfico real.

## Requisitos de hardware

- VRAM estimada: no establecida para cuantización; las pruebas reales se hicieron con el base de 4B en bfloat16, lo que requiere memoria suficiente para cargar el modelo completo (orientativamente, entre 8 y 10 GB solo para pesos en bf16, sin contar activaciones).
- GPU recomendadas: A100 (entorno de prueba documentado). No se ha verificado el comportamiento en otras GPU.
- GPU de consumo: no establecido; el autor no ha publicado pruebas en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: carga mediante `ModeraBR.from_pretrained` del helper `inference.py` del repositorio, cargando explícitamente `Qwen3_5ForConditionalGeneration` y después PEFT. No se ha establecido el soporte de vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.
- Advertencia de integración: evitar el merge genérico del output head con embeddings compartidos sin verificación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ModeraBR-4B-v3 | Adapter sobre 4B | 8.190 tokens | Clasificación de ofensividad, contexto y odio en pt | CC-BY-SA-4.0 | Hugging Face (33 descargas) |
| Qwen3.5-4B (base) | 4B | no disponible | Modelo generativo general | no disponible | Hugging Face |
| CPU TF-IDF (línea base del autor) | no aplica | no aplica | Clasificación clásica | no disponible | Referencia interna del proyecto |

No se dispone de datos publicados de otros clasificadores de moderación en portugués comparables en parámetros, contexto y licencia dentro de la información proporcionada.

## Limitaciones y advertencias

- Modelo marcado como experimental por el autor; no es una prueba de seguridad general ni una probabilidad calibrada de daño.
- La probabilidad devuelta es condicional a los dos dígitos legales, no una probabilidad validada de daño.
- La evidencia principal es transferencia con calibración en la fuente (HateBR), no zero-shot; el objetivo binario de HateBR es ofensividad, no discurso de odio.
- HateBR consiste en comentarios políticos y no representa toda la comunicación brasileña; la exposición de estos textos en el pretratamiento de los modelos es desconocida.
- OLID y HateCheck ya eran conocidos en el proyecto y constituyen evidencia de regresión, no de generalización.
- Los conjuntos sintéticos usan familias separadas del entrenamiento y etiquetas de modelo; no establecen rendimiento en tráfico real.
- Caída de recall en HateCheck de 99,07% a 97,09%, superior al límite original de 1 punto.
- No hay evidencia de superioridad en inglés, ni evaluación de validez de JSON libre, ni probabilidad de daño calibrada.
- Entradas superiores a 8.190 tokens, incluidos política y ejemplos, se rechazan sin truncamiento silencioso.
- La licencia CC-BY-SA-4.0 impone compartir bajo la misma licencia las obras derivadas; conviene revisar las obligaciones antes de uso comercial.
- No se ha establecido el rendimiento en CPU, cuantización u otros backends distintos de la GPU A100 empleada en las pruebas.
- Los números de versiones anteriores, con prompts no registrados íntegramente, no son comparables de forma controlada con los de esta versión.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ai-safety-brazil/moderabr-4b-v3
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Space SafetyEval-BR: https://huggingface.co/spaces/ai-safety-brazil/safetyeval-br
- Dataset mteb/told-br: https://huggingface.co/datasets/mteb/told-br
- Dataset dougtrajano/olid-br: https://huggingface.co/datasets/dougtrajano/olid-br
- Dataset ai-safety-brazil/moderacao-fronteiras-br-synthetic: https://huggingface.co/datasets/ai-safety-brazil/moderacao-fronteiras-br-synthetic
- Dataset ai-safety-brazil/odio-contexto-br-synthetic: https://huggingface.co/datasets/ai-safety-brazil/odio-contexto-br-synthetic
