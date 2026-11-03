# HRB25/inflect-micro-ptbr-20k

## Resumen

Inflect Micro PT-BR es un modelo de síntesis de voz (text-to-speech) de un único hablante en portugués de Brasil, obtenido mediante fine-tuning del modelo base `owensong/Inflect-Micro-v2` durante 20.000 pasos sobre 37,45 horas de audio de un solo locutor a 24 kHz. Lo desarrolla el usuario HRB25 y se distribuye con la licencia `inflect-research-license`, orientada a investigación. El objetivo del run es evaluar si una adaptación prolongada con un calendario de descongelación por etapas mejora la naturalidad prosódica sin degradar la inteligibilidad ya presente en el modelo base.

El modelo se apoya en una arquitectura de tipo VITS (generativa adversarial condicionada por texto, con codificador posterior y decoder acústico), según indican las etiquetas y la nomenclatura de pérdidas (`loss_g`, `loss_d`) del repositorio. El frontend fonético es espeak con marcado de estrés, y el inventario de símbolos se amplió de 178 a 181 entradas para cubrir tres grafemas del portugués (`õ`, `ũ` y el til combinante). El repositorio incluye el paquete PyTorch de inferencia, 24 audios de prueba en tres configuraciones de prosodia, 40 muestras de validación y los ficheros de configuración del entrenamiento.

La relevancia del modelo es doble: por un lado, ofrece una receta reproducible y números de entrenamiento abiertos para adaptar TTS a una lengua con poca representación en modelos abiertos; por otro, documenta explícitamente lo que no es (no es multilocutor, no es clonación de voz y no cuenta con evaluación MOS ni de inteligibilidad). Es, por tanto, una pieza de investigación más que un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VITS (TTS generativo adversarial con posterior encoder y decoder acústico), según etiquetas y métricas del repo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (TTS; la entrada es texto, no secuencia de contexto) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Portugués de Brasil (pt-BR) |
| Licencia | inflect-research-license (licencia de investigación; no es OSI) |
| Formato de pesos | paquete PyTorch (checkpoint `.pt`/`.pth`; no se especifica safetensors ni GGUF) |
| Modelo base | owensong/Inflect-Micro-v2 |
| Frecuencia de muestreo | 24 kHz |
| Hablantes | 1 (ID 2961) |
| Inventario de símbolos | 181 entradas (base 178 + `õ`, `ũ`, `̃`) |
| Frontend fonético | espeak con marcado de estrés |
| Dataset | brspeech (20.000 muestras; 19.123 train / 877 val; 37,45 h) |
| Hardware de entrenamiento | A100 40 GB, AMP |
| Preset | micro-12gb |

## Arquitectura y entrenamiento

El modelo sigue la familia VITS: un codificador de texto condiciona un decoder acústico entrenado de forma adversarial contra un discriminador, con un codificador posterior que modela la distribución latente del audio. El fine-tuning parte de `owensong/Inflect-Micro-v2` y aplica un calendario de descongelación en tres fases: durante los primeros 1.500 pasos solo entrena el posterior con learning rate creciente desde cero; el decoder permanece congelado hasta el paso 6.000 para preservar la calidad acústica del modelo base mientras se aprende el mapeo fonético del portugués; a partir de ahí el decoder entra con un learning rate menor. Al final del run las tasas son 6,95e-5 (posterior), 3,48e-5 (parte lingüística) y 6,95e-6 (decoder), una asimetría deliberada para no deshacer lo aprendido por el modelo base.

El corpus se preparó con `inflect-adapt prepare`, que valida duración, tasa de muestreo y cobertura fonética. El split está agrupado por `group_id` y normaliza el texto antes de separar train/val, de modo que la misma frase no aparece en ambos lados con puntuación distinta; por eso la validación quedó en 877 muestras en lugar de las 1.000 objetivo. El entrenamiento usó batch efectivo 8 (4 × 2 de acumulación), AMP, semilla 1234 para el run y 42 para el dataset, checkpoint y validación cada 500 pasos. No se documenta uso de RLHF ni DPO; el objetivo es puramente de reconstrucción adversarial y modelado latente.

## Capacidades

- Síntesis de voz a partir de texto en portugués de Brasil, con un único timbre de hablante fijo (ID 2961) a 24 kHz.
- Control de prosodia mediante dos parámetros expuestos: `speed` (velocidad) y `variation` (variabilidad entonativa). Las configuraciones documentadas son `default` (1.0 / 0.667), `slower` (0.90 / 0.667) y `varied` (0.95 / 0.80).
- Fonemización con espeak y marcado de estrés, con cobertura de los grafemas nasales del portugués (`õ`, `ũ`, til combinante).
- Generación de audio de duración variable; las muestras de validación y prueba van de 1,5 s a 12 s por clip, con una media aproximada de 6,7 s (134.807 s / 20.000 muestras).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio de entrada ni modo thinking: es exclusivamente un modelo TTS.
- No es multilocutor ni soporta clonación de voz: el timbre está fijado por el fine-tuning.

## Casos de uso

- **Locución de boletines y avisos institucionales**: el modelo puede leer textos cortos y medios en pt-BR con un timbre consistente, útil para sistemas de megafonía o avisos automatizados donde no se requiere variedad de voces y sí una pronunciación brasileña estable.
- **Audiolibros y contenido largo de un solo narrador**: al ser un modelo de hablante único, encaja en la producción de un audiolibro narrado por una voz sintética uniforme; conviene trocear el texto en fragmentos de 1,5-12 s (el rango visto en entrenamiento) y concatenar con cuidado de las pausas.
- **Prototipado de asistentes de voz en portugués**: sirve para validar pipelines de ASR + NLU + TTS en entornos de investigación donde se necesita una voz brasileña sin depender de servicios en la nube; su licencia de investigación restringe el uso comercial.
- **Investigación en adaptación de TTS a lenguas de bajos recursos**: el repositorio documenta la receta completa (preparación de datos, calendario de descongelación, métricas de pérdida), lo que lo convierte en una referencia reproducible para experimentos similares con otras lenguas o locutores.
- **Generación de material de evaluación prosódica**: los 24 audios en tres configuraciones permiten estudiar el efecto de `speed` y `variation` sobre la entonación en frases declarativas, interrogativas y exclamativas, sin necesidad de reentrenar.
- **Accesibilidad y lectura de pantalla en portugués**: puede integrarse en lectores de pantalla o aplicaciones de accesibilidad para usuarios brasileños, siempre que el despliegue respete los términos de la licencia de investigación.
- **Pruebas A/B de prosodia en productos de voz**: los parámetros `speed` y `variation` permiten comparar configuraciones sin cambiar de modelo, lo que facilita experimentos controlados de percepción antes de invertir en un TTS comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MOS, WER de inteligibilidad, MCD) en la información disponible. El autor indica explícitamente que no midió MOS ni ejecutó evaluador de transcripción. Los únicos datos cuantitativos son las pérdidas de entrenamiento:

| Pasos | loss_g | loss_d |
|---|---|---|
| 1–999 | 75,22 | 2,192 |
| 1.000–4.999 | 45,84 | 1,857 |
| 5.000–9.999 | 29,97 | 2,562 |
| 10.000–14.999 | 26,13 | 2,695 |
| 15.000–19.499 | 25,64 | 2,687 |
| 19.500–20.000 | 25,53 | 2,679 |

`loss_g` cae un 65 % entre la primera y la última franja, mientras que `loss_d` sube tras el paso 5.000 y se estabiliza en torno a 2,68, un patrón coherente con el equilibrio adversarial esperado. No se dispone de comparación numérica con otros modelos TTS.

## Requisitos de hardware

- **VRAM estimada para inferencia**: no disponible con precisión. El preset de entrenamiento es `micro-12gb`, lo que sugiere que el modelo base y su fine-tuning caben en GPUs de 12 GB con AMP; la inferencia debería requerir bastante menos, pero no se publica una cifra.
- **GPU recomendadas**: para entrenamiento, A100 40 GB (la usada en el run). Para inferencia, cualquier GPU con al menos 12 GB (RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090, A10, L4, A100, H100) debería ser suficiente, aunque no se confirma con mediciones.
- **¿Cabe en GPU de consumo?**: probablemente sí en RTX 3060 12 GB o superiores, dado el preset `micro-12gb`; no hay cifras publicadas de VRAM en inferencia.
- **Opciones de despliegue**: el repositorio es un paquete PyTorch; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplican a TTS VITS). El despliegue esperado es mediante script PyTorch propio o un wrapper sobre el paquete incluido.
- **Latencia y throughput**: no disponibles. No se publican tiempos de síntesis ni RTF (real-time factor).

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Inflect Micro PT-BR (este) | TTS VITS, hablante único | no disponible | no aplica | pt-BR | inflect-research-license | HuggingFace (repo PyTorch) |
| owensong/Inflect-Micro-v2 (base) | TTS VITS | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| Coqui TTS (VITS multilingüe) | TTS VITS | variable según checkpoint | no aplica | multilingüe | MPL-2.0 (código) / varias según modelo | GitHub, HuggingFace |
| Piper (rhasspy) | TTS VITS ligero | variable (modelos pequeños) | no aplica | multilingüe (incl. pt-BR) | MIT (código) / varias según voz | GitHub, HuggingFace |

La comparación es cualitativa porque no hay benchmarks publicados para este modelo. Frente a Piper o Coqui, la diferencia principal es la licencia: Inflect Micro PT-BR usa una licencia de investigación específica, mientras que Piper y Coqui ofrecen licencias permisivas para el código. Frente a su modelo base, la ventaja es el timbre brasileño y la cobertura de grafemas nasales; la desventaja es la falta de evaluación perceptual publicada.

## Limitaciones y advertencias

- **Sin evaluación perceptual**: el autor no midió MOS ni ejecutó evaluador de transcripción, por lo que no hay garantía cuantitativa de inteligibilidad ni de naturalidad. La calidad debe validarse con escucha propia antes de cualquier uso.
- **Hablante único**: no es multilocutor y no soporta clonación de voz; cualquier expectativa de cambiar de voz requiere otro fine-tuning.
- **Licencia restrictiva**: `inflect-research-license` no es una licencia OSI; el uso comercial puede estar limitado o requerir permiso explícito. Conviene revisar el texto completo de la licencia antes de desplegar.
- **Idioma único**: solo pt-BR; no hay soporte para portugués europeo ni para otras lenguas, y el frontend espeak puede introducir errores en palabras extranjeras, siglas o nombres propios.
- **Riesgo de alucinación acústica**: como todo TTS generativo, puede producir artefactos, ruidos o pronunciaciones incorrectas en entradas fuera de distribución (textos muy largos, símbolos raros, números, abreviaturas).
- **Rango de duración limitado**: el entrenamiento cubrió clips de 1,5 s a 12 s; frases mucho más largas pueden degradar la prosodia o la estabilidad.
- **Dataset de validación reducido**: 877 muestras agrupadas por `group_id`, lo que limita la representatividad de las métricas de validación.
- **Sesgos del corpus**: al provenir de `brspeech` con un único locutor (ID 2961), el timbre y el acento reflejan las características de esa persona y no la diversidad del portugués brasileño.
- **Repo de 0,0 GB**: el tamaño reportado en HuggingFace es 0,0 GB, lo que puede indicar que los pesos aún no están subidos o que la medición es incorrecta; verificar antes de descargar.
- **Sin soporte de tooling estándar de inferencia**: no hay integración documentada con vLLM, TGI, Ollama ni llama.cpp; el despliegue requiere código PyTorch propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HRB25/inflect-micro-ptbr-20k
- Modelo base: https://huggingface.co/owensong/Inflect-Micro-v2
- Dataset brspeech (referenciado en la model card): no disponible como enlace directo en la información proporcionada
- Paper de VITS (arquitectura de referencia): no disponible en la información proporcionada
- Repositorio del código `inflect-adapt`: no disponible en la información proporcionada
